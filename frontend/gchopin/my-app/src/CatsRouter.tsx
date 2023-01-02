import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";

type Cats = {
	name: string,
	age: number,
	breed: string,
	text: string
}

const GetCats = ({name, age, breed, text}: Cats) => {
    //quick Getter test with hook
    const [cats, setCats] = useState<Cats[]>({} as Cats[]);

    const getCats = async () => {
        const res = await fetch("http://localhost:8080/cats")
            .then(res => res.json());
        setCats(res);
    }
    useEffect(() => {
        getCats();
        }, []);
    return (
        <ul>
      {cats &&
        cats.map((cat) => (
          <li>
            name: {cat.name} age: {cat.age} breed: {cat.breed}
          </li>
        ))}
        </ul>
        );
}

const NavCats = ({}) => {
    return (
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
    )
};



const CatsRouter = ({ }) => {
    return (
        <Routes>
            <Route path="/" element={<NavCats/>}>
                <Route path="/cats" element={<GetCats/>}></Route>
            </Route>
        </Routes>
    )
};

export default CatsRouter;