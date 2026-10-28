import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';

import Alert from '../components/Alert.jsx';
import useAlert from '../hooks/useAlert.js';

const Contact = () => {
  //! PRIVATE INFO hidden in env (.env needs to be placed in ./src)
  const serviceID = import.meta.env.VITE_APP_EMAILJS_SERVICE_ID;
  const templateID = import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY;
  const toName = import.meta.env.VITE_APP_EMAILJS_TO_NAME;
  const toEmail = import.meta.env.VITE_APP_EMAILJS_TO_EMAIL;

  const formRef = useRef();

  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        serviceID,
        templateID,
        {
          from_name: form.name,
          to_name: toName,
          from_email: form.email,
          to_email: toEmail,
          message: form.message,
        },
        publicKey,
      )
      .then(
        () => {
          setLoading(false);
          showAlert({
            show: true,
            text: 'Thank you for your message 😃',
            type: 'success',
          });

          setTimeout(() => {
            hideAlert(false);
            setForm({
              name: '',
              email: '',
              message: '',
            });
          }, [3000]);
        },
        (error) => {
          setLoading(false);
          console.error(error);

          showAlert({
            show: true,
            text: "I didn't receive your message 😢",
            type: 'danger',
          });
        },
      );
  };

  return (
    <section className="c-space my-20" id="contact">
      {alert.show && <Alert {...alert} />}

      <div className="relative min-h-full lg:min-h-[859px] flex items-center justify-center flex-col">
        <img src="/assets/terminal.png" alt="terminal-bg" className="absolute  hidden lg:block h-full xl:h-auto" />

        <div className="contact-container">
          <h3 className="head-text">Let&apos;s talk</h3>
          <p className="text-lg text-white-600 mt-3">
            Whether you&apos;re looking to build a new website, improve your existing platform, or bring a unique
            project to life, I&apos;m here to help.
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-12 flex flex-col space-y-7">
            <label className="space-y-3">
              <span className="field-label">Full Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="ex., John Doe"
              />
            </label>

            <label className="space-y-3">
              <span className="field-label">Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="ex., johndoe@gmail.com"
              />
            </label>

            <label className="space-y-3">
              <span className="field-label">Your message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="field-input textarea-scrollbar"
                placeholder="Share your thoughts or inquiries..."
              />
            </label>

            <button className="field-btn" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}

              <img src="/assets/arrow-up.png" alt="arrow-up" className="field-btn_arrow" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
