import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuth } from "../../utils/auth";

const AuthRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const isLogin = isAuth();

        if (isLogin) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: props.location,
                },
              }}
            />
          );
        }
      }}
    ></Route>
  );
};

export default AuthRoute;
