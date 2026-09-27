import { Link } from "react-router-dom";
import "./landing-page.css";
import {useTranslation} from "react-i18next";

export default function LandingPage() {
  const {t} = useTranslation();

  return (
    <div className="app-bg">

      <section className="hero">
        <h1>{t("landing.learn")}</h1>
        <p>
          {t("landing.training")}
        </p>
        <div className="hero-actions">
          <Link className="btn-dojo btn-dojo--action" to="/register">
            {t("landing.register")}
          </Link>
          <Link className="btn-dojo" to="/login">
            {t("landing.login")}
          </Link>
        </div>
      </section>

      <section className="panel-parchment">
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🥋</div>
            <h3>{t("landing.progressive_katas_title")}</h3>
            <p>{t("landing.progressive_katas_text")}</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🏯</div>
            <h3>{t("landing.multiple_disciplines_title")}</h3>
            <p>{t("landing.multiple_disciplines_text")}</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📜</div>
            <h3>{t("landing.tests_title")}</h3>
            <p>{t("landing.tests_text")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
