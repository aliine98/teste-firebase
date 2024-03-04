"use client";

import Image from "next/image";
import { storage, db } from "./firebase";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as React from "react";
import Form from "react-bootstrap/Form";
import { useEffect, useState, useReducer } from "react";
import Alunos from "./alunos";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface IAluno {
  name: string;
  belt: string;
  photo: File;
  photoName: string;
}

export default function Home() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imageList, setImageList] = useState<string[]>([]);
  const storageRef = ref(storage, "galeria");
  useEffect(() => {
    listAll(storageRef).then((res) => {
      res.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  const uploadImage = () => {
    if (image === null) return;
    const imageRef = ref(storage, `galeria/${image?.name}`);
    uploadBytes(imageRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url: string) => {
        setImageList((prev: string[]) => [...prev, url]);
      });
    });
  };

  const deleteImage = (url: string) => {
    const imageRef = ref(storage, url);
    deleteObject(imageRef).then(() => {
      setImageList(imageList.filter((image: string) => image !== url));
    });
  };

  const [aluno, setAluno] = useState({} as IAluno);

  const addAluno = async () => {
    const photoRef = ref(storage, `alunos/${aluno.photoName}`);
    uploadBytes(photoRef, aluno.photo).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url: string) => {
        addDoc(collection(db, "alunos"), {
          name: aluno.name,
          belt: aluno.belt,
          photo: url,
        }).then(() => {
          router.refresh();
        });
      });
    });
  };

  const signIn = (email: string, password: string) => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.refresh();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  const user = getAuth().currentUser;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email:</Form.Label>
          <Form.Control
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Label>Senha:</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <button onClick={() => signIn(email, password)}>Entrar</button>
        <Link href="/forgot-password">Esqueci minha senha</Link>
      </Form>
      {user && (
        <div>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setImage((e.target as HTMLInputElement).files![0])}
          />
          <button onClick={uploadImage}>Adicionar imagem</button>
        </div>
      )}
      <ul>
        {imageList.map((url: string, index: number) => (
          <li key={index}>
            <Image src={url} key={index} width={200} height={200} alt="" />
            {user && <button onClick={() => deleteImage(url)}>Remover</button>}
          </li>
        ))}
      </ul>
      <h1>Alunos</h1>
      {user && (
        <form onSubmit={(e) => e.preventDefault()}>
          <label>
            Nome:{" "}
            <input
              type="text"
              onChange={(e) => setAluno({ ...aluno, name: e.target.value })}
            />
          </label>
          <label>
            Faixa:{" "}
            <input
              type="text"
              onChange={(e) => setAluno({ ...aluno, belt: e.target.value })}
            />
          </label>
          <label>
            Foto:{" "}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setAluno({
                  ...aluno,
                  photo: (e.target as HTMLInputElement).files![0],
                  photoName: (e.target as HTMLInputElement).files![0].name,
                });
              }}
            />
          </label>
          <button onClick={addAluno}>Adicionar</button>
        </form>
      )}

      <Alunos />
    </>
  );
}
