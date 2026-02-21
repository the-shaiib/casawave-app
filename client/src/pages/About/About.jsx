import './About.css';

function About() {
  return (
    <section className="about-page">
      <div className="about-wrap">
        <p className="about-kicker">ABOUT CASAWAVE</p>
        <h1>CASAWAVE — Ride the Wave of Modern Style.</h1>

        <p className="about-lead">
          CASAWAVE is a modern online store inspired by the energy of Casablanca and the creativity
          of the new generation. We focus on simple design, useful products, and a smooth shopping
          experience.
        </p>

        <div className="about-grid">
          <article className="about-block">
            <h3>Our Mission</h3>
            <p>
              Our mission is to bring trending, practical, and stylish products into one place
              while keeping the experience fast and enjoyable for everyone.
            </p>
          </article>

          <article className="about-block">
            <h3>Why CASAWAVE</h3>
            <ul className="about-list">
              <li>Quality products</li>
              <li>Clean and modern shopping experience</li>
              <li>Designed for everyday life</li>
            </ul>
          </article>
        </div>

        <article className="about-story">
          <h3>Our Story</h3>
          <p>
            CASAWAVE started as a simple idea — create a modern online store that feels easy to
            explore and enjoyable to use. Inspired by digital culture and urban lifestyle, CASAWAVE
            represents simplicity, creativity, and the future of online shopping.
          </p>
        </article>
      </div>
    </section>
  );
}

export default About;
