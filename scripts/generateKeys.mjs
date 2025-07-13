import crypto from "crypto";
import fs from "fs";

// Create the certs directory if it doesn't exist
if (!fs.existsSync("certs")) {
    fs.mkdirSync("certs", { recursive: true });
}

const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "pkcs1", // Keeping as pkcs1 as you prefer
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs1", // This is correct for private keys
        format: "pem",
    },
});

fs.writeFileSync("certs/private.pem", privateKey);
fs.writeFileSync("certs/public.pem", publicKey);
console.log("Public Key", publicKey);
console.log("Private key", privateKey);
