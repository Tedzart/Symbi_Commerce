// app/api/register/route.js
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request) {
  console.log('Registration request received');
  
  // 1. Verify pool connection
  if (!pool) {
    console.error('FATAL: Database pool not initialized');
    return Response.json(
      { success: false, message: 'Database configuration error' },
      { status: 500 }
    );
  }

  let client;
  try {
    // 2. Parse incoming data
    const data = await request.json().catch(() => {
      throw new Error('Invalid JSON format');
    });
    console.log('Parsed data:', data);

    // 3. Validate required fields
    const requiredFields = [
      'fName', 'lName', 'age', 
      'gender', 'country', 'email',
      'password', 'confirmPassword'
    ];
    
    const missing = requiredFields.filter(field => !data[field]);
    if (missing.length) {
      return Response.json(
        { 
          success: false, 
          message: `Missing fields: ${missing.join(', ')}`,
          error: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // 4. Validate passwords match
    if (data.password !== data.confirmPassword) {
      return Response.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // 5. Connect to database
    console.log('Connecting to database...');
    client = await pool.connect();
    
    // 6. Check for existing email
    const emailCheck = await client.query(
      'SELECT id FROM cusinfo WHERE email = $1', 
      [data.email]
    );
    
    if (emailCheck.rows.length > 0) {
      return Response.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // 7. Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 8. Insert new user
    console.log('Inserting user...');
    const result = await client.query(
      `INSERT INTO cusinfo 
       (fname, lname, age, gender, country, email, password, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
       RETURNING id, fname, lname, email, datecreated`,
      [
        data.fName,
        data.lName,
        parseInt(data.age),
        data.gender,
        data.country,
        data.email,
        hashedPassword,
        'customer'
      ]
    );

    console.log('Registration successful:', result.rows[0]);
    return Response.json(
      { 
        success: true, 
        message: 'Registration successful',
        user: result.rows[0] 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('REGISTRATION ERROR:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      time: new Date().toISOString()
    });

    return Response.json(
      { 
        success: false,
        message: process.env.NODE_ENV === 'development'
          ? `Server error: ${error.message}`
          : 'Server error. Please try again later.'
      },
      { status: 500 }
    );

  } finally {
    if (client) {
      console.log('Releasing database connection...');
      client.release();
    }
  }
}