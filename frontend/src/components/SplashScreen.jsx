export default function SplashScreen() {
  return (
    <div className="splash" role="status" aria-live="polite">
      <div className="splash-inner">
        <img
          src="/icon-192.png"
          alt=""
          className="splash-logo"
          width="96"
          height="96"
        />
        <h1>LesMatch</h1>
        <p>Menghubungkan siswa les dengan tentor yang tepat.</p>
        <span className="splash-progress" aria-hidden="true" />
      </div>
    </div>
  )
}
