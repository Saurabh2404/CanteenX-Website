import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="section">
      <p className="eyebrow">A WRONG TURN</p>
      <h1>Let’s get you back.</h1>
      <p className="my-6">The page you’re looking for could not be found.</p>
      <Link className="button" href="/">
        Back to the canteen
      </Link>
    </main>
  );
}
