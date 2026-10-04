const keysTable = document.getElementById("keysTable");

const generateButton =
    document.getElementById("generateButton");

const duration =
    document.getElementById("duration");

const generatedKey =
    document.getElementById("generatedKey");

const generatedKeyValue =
    document.getElementById("generatedKeyValue");

const copyKeyButton =
    document.getElementById("copyKeyButton");

const refreshButton =
    document.getElementById("refreshButton");

const logoutButton =
    document.getElementById("logoutButton");


async function api(url, options = {}) {

    const response = await fetch(url, {
        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },

        ...options
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (response.status === 401) {
        window.location.href = "/";
        return;
    }

    if (!response.ok) {
        throw new Error(
            data.error || "Une erreur est survenue."
        );
    }

    return data;
}


function formatDate(value) {

    if (!value) {
        return "Jamais";
    }

    return new Date(value).toLocaleString(
        "fr-FR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


function durationLabel(duration) {

    const labels = {
        "1d": "1 jour",
        "7d": "7 jours",
        "30d": "30 jours",
        "unlimited": "Illimitée"
    };

    return labels[duration] || duration;
}


function statusLabel(status) {

    if (status === "active") {
        return "Actif";
    }

    if (status === "revoked") {
        return "Révoqué";
    }

    return status;
}


function maskHash(hash) {

    if (!hash) {
        return "—";
    }

    return hash.substring(0, 12) + "...";
}


async function loadKeys() {

    keysTable.innerHTML = `
        <tr>
            <td colspan="6" class="loading">
                Chargement...
            </td>
        </tr>
    `;

    try {

        const data = await api("/admin/keys");

        if (!data.keys || data.keys.length === 0) {

            keysTable.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        Aucune clé pour le moment.
                    </td>
                </tr>
            `;

            return;
        }


        keysTable.innerHTML = "";

        for (const key of data.keys) {

            const row = document.createElement("tr");

            const statusClass =
                key.status === "active"
                    ? "active"
                    : "revoked";


            row.innerHTML = `
                <td class="key-cell">
                    SHA-256 ${maskHash(key.key_hash)}
                </td>

                <td>
                    ${durationLabel(key.duration)}
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${statusLabel(key.status)}
                    </span>
                </td>

                <td>
                    ${formatDate(key.created_at)}
                </td>

                <td>
                    ${formatDate(key.expires_at)}
                </td>

                <td>
                    ${
                        key.status === "active"
                            ? `
                                <button
                                    class="revoke-button"
                                    data-id="${key.id}"
                                >
                                    Révoquer
                                </button>
                            `
                            : "—"
                    }
                </td>
            `;


            const revokeButton =
                row.querySelector(".revoke-button");


            if (revokeButton) {

                revokeButton.addEventListener(
                    "click",
                    async () => {

                        const confirmed =
                            confirm(
                                "Voulez-vous vraiment révoquer cette clé ?"
                            );

                        if (!confirmed) {
                            return;
                        }

                        revokeButton.disabled = true;

                        try {

                            await api(
                                `/admin/keys/${key.id}/revoke`,
                                {
                                    method: "POST"
                                }
                            );

                            await loadKeys();

                        } catch (error) {

                            alert(error.message);

                            revokeButton.disabled = false;
                        }
                    }
                );
            }


            keysTable.appendChild(row);
        }

    } catch (error) {

        keysTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    ${error.message}
                </td>
            </tr>
        `;
    }
}


generateButton.addEventListener(
    "click",
    async () => {

        generateButton.disabled = true;

        generateButton.textContent =
            "Génération...";

        generatedKey.hidden = true;

        try {

            const data = await api(
                "/admin/keys",
                {
                    method: "POST",

                    body: JSON.stringify({
                        duration: duration.value
                    })
                }
            );


            generatedKeyValue.textContent =
                data.key;

            generatedKey.hidden = false;

            await loadKeys();

        } catch (error) {

            alert(error.message);

        } finally {

            generateButton.disabled = false;

            generateButton.textContent =
                "🔑 Générer";
        }
    }
);


copyKeyButton.addEventListener(
    "click",
    async () => {

        const key =
            generatedKeyValue.textContent;

        if (!key) {
            return;
        }

        try {

            await navigator.clipboard.writeText(key);

            copyKeyButton.textContent =
                "✓ Copié !";

            setTimeout(() => {

                copyKeyButton.textContent =
                    "📋 Copier";

            }, 1500);

        } catch {

            alert(
                "Impossible de copier automatiquement la clé."
            );
        }
    }
);


refreshButton.addEventListener(
    "click",
    loadKeys
);


logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await api(
                "/admin/logout",
                {
                    method: "POST"
                }
            );

        } finally {

            window.location.href = "/";
        }
    }
);


async function init() {

    try {

        await api("/admin/me");

        await loadKeys();

    } catch {

        window.location.href = "/";
    }
}


init();
