"use client";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Form from "react-bootstrap/Form";

export default function PasswordReset() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const sendPasswordReset = (email: string) => {
    sendPasswordResetEmail(getAuth(), email).then(() => {
      router.push("/");
    });
  };
  return (
    <>
      <h1>Recuperar senha</h1>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group>
          <Form.Label>Email:</Form.Label>
          <Form.Control
            type="email"
            onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          />
          <button type="submit" onClick={() => sendPasswordReset(email)}>
            Enviar
          </button>
        </Form.Group>
      </Form>
    </>
  );
}
