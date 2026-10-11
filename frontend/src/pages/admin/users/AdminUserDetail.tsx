import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {getAdminUser} from "../../../api/adminApi.ts";
import type {AdminUser} from "../../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";
import {Loading} from "../../../components/ui/Loading.tsx";
import {formatDate} from "../../../utils/utils.ts";

function AdminUserDetail() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            return;
        }

        const loadUser = async () => {
            try {
                setLoading(true);
                setError(null);

                const user = await getAdminUser(userId);
                setUser(user);
            } catch {
                setError(t("admin.users.load-error"));
            } finally {
                setLoading(false);
            }
        };

        void loadUser();
    }, [userId, t]);

    if (loading) {
        return <Loading />;
    }
    if (error && !user) {
        return (
            <section>
                <p role="alert">{error}</p>
                <button onClick={() => navigate("/back-office/users")}>
                    {t("common.back")}
                </button>
            </section>
        );
    }

    if (!user) return null;

    return (
        <section className="admin-user-detail">
            <button
                className={"btn-dojo"}
                type="button"
                onClick={() => navigate("/back-office/users")}
            >
                ← {t("common.back")}
            </button>

            <h1>{user.username}</h1>

            {error && <p role="alert">{error}</p>}

            <dl>
                <dt>{t("admin.users.id")}</dt>
                <dd>{user.id}</dd>

                <dt>{t("admin.users.email")}</dt>
                <dd>{user.email}</dd>

                <dt>{t("admin.users.role")}</dt>
                <dd>{user.role}</dd>

                <dt>{t("admin.users.registration")}</dt>
                <dd>{formatDate(user.created_at)}</dd>

                <dt>{t("admin.users.status")}</dt>
                <dd>{user.is_active
                    ? t("admin.users.active")
                    : t("admin.users.inactive")}</dd>
            </dl>
        </section>
    );
}



export default AdminUserDetail;
