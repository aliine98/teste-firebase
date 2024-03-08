"use client";

import Image from "next/image";
import { Inter } from "next/font/google";
import { storage, db } from "./firebase";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
  list,
  ListResult,
} from "firebase/storage";
import * as React from "react";
import Button from "@mui/material/Button";
import { useEffect, useState, useReducer } from "react";
import Alunos from "./alunos";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "@mui/material/Link";
import {
  FormControl,
  FormGroup,
  IconButton,
  Input,
  TextField,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

const inter = Inter({ subsets: ["latin"] });

const theme = createTheme({
  palette: {
    primary: {
      main: "#B53F41",
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
});

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
  const firstPage = list(storageRef, { maxResults: 2 });
  const [nextPage, setNextPage] = useState<ListResult>();
  // useEffect(() => {
  //   listAll(storageRef).then((res) => {
  //     res.items.forEach((item) => {
  //       getDownloadURL(item).then((url) => {
  //         setImageList((prev) => [...prev, url]);
  //       });
  //     });
  //   });
  // }, []);

  useEffect(() => {
    firstPage.then((res) => {
      res.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  const loadNextGaleryPage = async () => {
    if (nextPage) {
      const page = await list(storageRef, {
        maxResults: 2,
        pageToken: nextPage!.nextPageToken,
      });
      if (page.nextPageToken) {
        setImageList([]);
        page.items.forEach((item) => {
          getDownloadURL(item).then((url) => {
            setImageList((prev) => [...prev, url]);
          });
        });
        setNextPage(page);
      }
    }
    const page = await list(storageRef, {
      maxResults: 2,
      pageToken: (await firstPage).nextPageToken,
    });
    if (page.nextPageToken) {
      setImageList([]);
      page.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        });
      });
      setNextPage(page);
    }
  };

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
      <ThemeProvider theme={theme}>
        <form onSubmit={(e) => e.preventDefault()}>
          <FormControl>
            <TextField
              type="email"
              label="Email"
              size="small"
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              type="password"
              label="Senha"
              size="small"
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              // sx={{
              //   backgroundColor: "#3234a8",
              //   mb: 2,
              //   "&:hover": { backgroundColor: "#393ce3" },
              // }}
              size="small"
              onClick={() => signIn(email, password)}
            >
              Entrar
            </Button>
            <Link href="/forgot-password" variant="body2" underline="always">
              Esqueci minha senha
            </Link>
          </FormControl>
        </form>
        {user && (
          <div>
            <Button startIcon={<CloudUpload />} sx={{ position: "relative" }}>
              {image ? image?.name.slice(0, 25) + "..." : "Selecionar Foto"}
              <input
                type="file"
                accept="image/*"
                style={{ position: "absolute", opacity: 0, cursor: "pointer" }}
                onChange={(e) =>
                  setImage((e.target as HTMLInputElement).files![0])
                }
              />
            </Button>
            <Button variant="contained" onClick={uploadImage}>
              Adicionar
            </Button>
            <Button variant="contained" color="error" onClick={uploadImage}>
              Adicionar
            </Button>
          </div>
        )}
        <ul>
          {imageList.map((url: string, index: number) => (
            <li key={index}>
              <Image src={url} key={index} width={200} height={200} alt="" />
              {user && (
                <button onClick={() => deleteImage(url)}>Remover</button>
              )}
            </li>
          ))}
        </ul>
        <Button></Button>
        <Button onClick={loadNextGaleryPage}>Próximo</Button>
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
      </ThemeProvider>
    </>
  );
}
