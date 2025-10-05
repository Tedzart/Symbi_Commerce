// app/test/page.js
export default function Test() {
    return (
      <div>
        <p>DB URL: {process.env.DATABASE_URL}</p>
      </div>
    );
  }