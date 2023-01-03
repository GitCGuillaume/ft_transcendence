import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Outlet } from "react-router-dom";
import NotFound from './NotFound';
const Form = React.lazy(() => import("./TestForm"));
type Cats = {
	name: string,
	age: number,
	breed: string,
	text: string
}

const GetCats = ({}) => {
    //quick Getter test with hook
    const [cats, setCats] = useState<Cats[]>([] as Cats[]);

    const getCats = async () => {
        const res = await fetch("http://localhost:8080/cats")
            .then(res => res.json());
        setCats(res);
    }
    useEffect(() => {
        getCats();
        }, []);
    let i = 0;
    return (
        <ul>
      {cats &&
        cats.map((cat) => (
          <li key={++i}>
            name: {cat.name} age: {cat.age} breed: {cat.breed}
          </li>
        ))}
        </ul>
        );
}

const Root = ({}) => {
    return (
      <>
        <Form />
        <Form />
        <Form />
        <nav>
        <ul>
          <li>
            <Link to="/">Root link</Link>
          </li>
          <li>
            <Link to="/cats">Cats link</Link>
          </li>
        </ul>
      </nav>
      <Outlet />
      </>
    )
};



const CatsRouter = ({ }) => {
    return (
      <React.Suspense>
        <Routes>
            <Route path="*" element={<NotFound />}/>
            <Route path="/" element={<Root />}>
                <Route index path="/cats" element={<GetCats />} />
            </Route>
        </Routes>
      </React.Suspense>
    )
};

export default CatsRouter;