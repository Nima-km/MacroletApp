export async function createUsername(username: string, token: string) {
    console.log(JSON.stringify(username));
    const response = await fetch(
        "http://192.168.1.239:8000/test/set-username/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username: username }),
        },
    );
    if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
    }

    return response;
}
