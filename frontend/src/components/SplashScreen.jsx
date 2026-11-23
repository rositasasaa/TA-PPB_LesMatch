export default function SplashScreen() {
  return (
    <div className="splash" role="status" aria-live="polite">
      <div className="splash-inner">
        <img
          src="/icon-lesmatch.png"
          alt="LesMatch"
          className="splash-logo brightness-0 invert"
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
