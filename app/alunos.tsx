import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "./firebase";
import { getAuth } from "firebase/auth";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Alunos() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [newPhoto, setNewPhoto] = useState<File>();
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

  const editName = (id: string) => {
    const newName = prompt("Qual o novo nome?");
    if (newName) {
      updateDoc(doc(db, "alunos", id), { name: newName }).then(() => {
        setAlunos(
          alunos.map((aluno) =>
            aluno.id === id ? { ...aluno, name: newName } : aluno,
          ),
        );
      });
    }
  };

  const editBelt = (id: string) => {
    const newBelt = prompt("Qual a nova faixa?");
    if (newBelt) {
      updateDoc(doc(db, "alunos", id), { belt: newBelt }).then(() => {
        setAlunos(
          alunos.map((aluno) =>
            aluno.id === id ? { ...aluno, belt: newBelt } : aluno,
          ),
        );
      });
    }
  };

  const editPhoto = async (id: string) => {
    if (newPhoto) {
      try {
        const docRef = doc(db, "alunos", id);
        const snapshot = await getDoc(docRef);
        const oldPhotoRef = ref(storage, snapshot.data()?.photo);
        await deleteObject(oldPhotoRef);
        const imageRef = ref(storage, `alunos/${newPhoto.name}`);
        const res = await uploadBytes(imageRef, newPhoto);
        const url = await getDownloadURL(res.ref);
        updateDoc(docRef, { photo: url }).then(() => {
          setAlunos(
            alunos.map((aluno) =>
              aluno.id === id ? { ...aluno, photo: newPhoto } : aluno,
            ),
          );
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const user = getAuth().currentUser;

  return (
    <ul>
      {alunos.map((aluno, index) => (
        <li key={index}>
          <div>
            <p>Nome: {aluno.name}</p>
            {user && <button onClick={() => editName(aluno.id)}>Editar</button>}
          </div>
          <div>
            <p>Faixa: {aluno.belt} </p>
            {user && <button onClick={() => editBelt(aluno.id)}>Editar</button>}
          </div>
          <div>
            <Image src={aluno.photo} width={200} height={200} alt=""></Image>
            {user && (
              <div>
                <input
                  type="file"
                  onChange={(e) => setNewPhoto(e.target.files![0])}
                />
                <button onClick={() => editPhoto(aluno.id)}>Trocar foto</button>
              </div>
            )}
          </div>
          {user && (
            <button onClick={() => deleteAluno(aluno.id)}>Remover</button>
          )}
        </li>
      ))}
    </ul>
  );
}
