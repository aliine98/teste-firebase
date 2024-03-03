import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Alunos() {
  const [alunos, setAlunos] = useState<any[]>([]);
  useEffect(() => {
    getDocs(collection(db, "alunos")).then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setAlunos((prev) => [...prev, { ...doc.data(), id: doc.id }]);
      });
    });
  }, []);

  const deleteAluno = (id: string) => {
    deleteDoc(doc(db, "alunos", id)).then(() => {
      setAlunos(alunos.filter((aluno) => aluno.id !== id));
    });
  };

  const user = getAuth().currentUser;

  return (
    <ul>
      {alunos.map((aluno, index) => (
        <li key={index}>
          <p>Nome: {aluno.name}</p>
          <p>Faixa: {aluno.belt} </p>
          <Image src={aluno.photo} width={200} height={200} alt=""></Image>
          {user && (
            <button onClick={() => deleteAluno(aluno.id)}>Remover</button>
          )}
        </li>
      ))}
    </ul>
  );
}
