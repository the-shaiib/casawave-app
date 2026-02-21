import './Contact.css';

function Contact() {
  return (
    <section className="contact-page">
      <div className="contact-wrap">
        <div className="contact-intro">
          <p className="contact-kicker">CONTACT</p>
          <h1>Have a question, a project idea, or just want to say hello?</h1>
          <p>
            Feel free to reach out. CASAWAVE is built to keep communication simple, direct, and
            helpful.
          </p>

          <div className="contact-socials">
            <a href="#">INSTAGRAM</a>
            <a href="#">TIKTOK</a>
            <a href="#">FACEBOOK</a>
          </div>
        </div>

        <div className="contact-card">
          <p className="contact-card-title">DIRECT CONTACT</p>
          <div className="contact-card-item">
            <span>Phone</span>
            <a href="tel:+212641279358">+212 641 279 358</a>
          </div>
          <div className="contact-card-item">
            <span>Email</span>
            <a href="mailto:hello@casawave.store">hello@casawave.store</a>
          </div>
          <p className="contact-card-note">
            Our team is available every day and replies as quickly as possible.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Contact;
