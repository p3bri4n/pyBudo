import { useTranslation } from "react-i18next";

interface LoadingProps {
    message?: string;
}

export function Loading({ message }: LoadingProps) {
    const { t } = useTranslation();

    return (
        <div className="loading">
            <p>{message ?? t("common.loading")}</p>
        </div>
    );
}
