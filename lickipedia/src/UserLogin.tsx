import axios from "axios";
import { useState } from "react";
import { LoginState } from "./util";
import styles from "../styles/RightColumn.module.scss";

interface UserLoginProps {
  loginInfo: boolean;
  setRightColumnState: (loginState: boolean) => void;
}

export default function (props: UserLoginProps): JSX.Element {
  const [loginFields, setLoginFields] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const handleChange = (event: any) => {
    const target = event.target;
    const name = target.name;
    setLoginFields({
      ...loginFields,
      [name]: event.target.value,
    });
  };

  /**
   * connect to postgres via PHP controller.
   * if the return statement is true, login was successful.
   *
   * @see lickiphpedia/services/UserManager.php - getUserInfo()
   * @todo add a REAL pop up that tells you that the login was (un)successful
   */
  const handleSignIn = (event: any): void => {
    axios
      .post("http://127.0.0.1:8000/api/loginUser", {
        email: loginFields.email,
        password: loginFields.password,
      })
      .then((res) => {
        if (res.data.length > 0) {
          props.setRightColumnState(true);
          console.log("succ");
        } else {
          setLoginFields({
            email: "",
            password: "",
          });
          alert("login unsuccessful");
        }
        console.log(res.data);
      });
    event.preventDefault();
  };

  const handleLogout = () => {
    setLoginFields({ email: "", password: "" });
    props.setRightColumnState(false);
    alert("successfully logged out. come back soon.");
  };

  const handleSignUp = (event: any) => {
    axios
      .post("http://127.0.0.1:8000/api/createUser", {
        email: loginFields.email,
        password: loginFields.password,
      })
      .then((res) => {
        if (res.data === true) {
          props.setRightColumnState(true);
          alert("account created successfully");
        } else {
          setLoginFields({
            email: "",
            password: "",
          });
          alert(res.data);
        }
      });
    event.preventDefault();
  };

  return (
    <div>
      {!props.loginInfo ? (
        <div className={styles.logininfo}>
          <form>
            <input
              type="text"
              name="email"
              value={loginFields.email}
              placeholder="email"
              onChange={handleChange}
            />
            <input
              type="text"
              name="password"
              value={loginFields.password}
              placeholder="password"
              onChange={handleChange}
            />
            <input type="submit" value="sign in" onClick={handleSignIn} />
          </form>
          <input type="button" value="sign up" onClick={handleSignUp} />
        </div>
      ) : (
        <div>
          welcome user
          <input type="button" value="logout" onClick={handleLogout} />
          <div />
        </div>
      )}
    </div>
  );
}
