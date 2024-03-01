"use client";

import Image from "next/image";
import { storage } from "./firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import * as React from "react";
import Form from "react-bootstrap/Form";
import { useEffect, useState, useReducer } from "react";
import Alunos from "./alunos";

export default function Home() {
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
      console.log(snapshot.metadata.name);
      getDownloadURL(snapshot.ref).then((url: string) => {
        setImageList((prev: string[]) => [...prev, url]);
      });
    });
  };

  return (
    <>
      <Form.Control
        type="file"
        accept="image/*"
        onChange={(e) => setImage((e.target as HTMLInputElement).files![0])}
      />
      <button onClick={uploadImage}>Adicionar imagem</button>
      <ul>
        {imageList.map((url: string, index: number) => (
          <Image src={url} key={index} width={200} height={200} alt="" />
        ))}
      </ul>
      <h1>Alunos</h1>
      <p>Adicionar alunos</p>
      <form>
        <label>
          Nome: <input type="text" />
        </label>
        <label>
          Faixa: <input type="text" />
        </label>
        <label>
          Foto: <input type="file" accept="image/*" />
        </label>
        <input type="submit" />
      </form>

      <Alunos />
    </>
  );
}
