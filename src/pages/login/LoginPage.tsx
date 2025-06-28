import { useToggle, upperFirst } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
} from "@mantine/core";
import { GoogleButton } from "../../components/GoogleButton";
import "@mantine/core/styles.css";
import "./login.css";
import { useAuth } from "../../context/AuthProvider";
import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage(props) {
  const navigate = useNavigate();
  const auth = useAuth();

  const FocusRef = useRef(null);

  const [type, toggle] = useToggle(["login", "register"]);
  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: true,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  useEffect(() => {
    if (auth.user) {
      navigate(`/notes`, { replace: true });
    }
  }, []);

  const handleToggle = () => {
    toggle();
    form.reset();
    auth.error = null;
    FocusRef.current.focus();
  };

  const handleChange = (event) => {
    auth.error = null;
    form.setFieldValue(event.target.name, event.currentTarget.value);
  };

  const handleSubmit = async () => {
    // event.preventDefault();
    // const formData = new FormData(event.currentTarget);
    // const username = formData.get("username");
    const user = form.values;
    try {
      type === "login" ? await auth.signIn(user) : await auth.signUp(user);
      navigate(`/notes`, { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <Paper radius="md" p="xl" withBorder {...props} className="loginForm">
        <Text size="lg" fw={500}>
          Welcome to Note, {type} with
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleButton radius="xl" >Google</GoogleButton>
          {/* <TwitterButton radius="xl">Twitter</TwitterButton> */}
        </Group>

        <Divider
          label="Or continue with email"
          labelPosition="center"
          my="lg"
        />
        <form
          onSubmit={form.onSubmit(() => {
            handleSubmit();
          })}
        >
          <Stack>
            {type === "register" && (
              <TextInput
                label="Name"
                name="name"
                placeholder="Your name"
                value={form.values.name}
                onChange={handleChange}
                radius="md"
                autoFocus
              />
            )}

            <TextInput
              required
              name="email"
              label="Email"
              placeholder="hello@mantine.dev"
              value={form.values.email}
              onChange={handleChange}
              error={form.errors.email && "Invalid email"}
              radius="md"
              autoFocus={type === "login" ? true : false}
              ref={FocusRef}
            />

            <PasswordInput
              required
              name="password"
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={handleChange}
              error={
                form.errors.password &&
                "Password should include at least 6 characters"
              }
              radius="md"
            />
            <p style={{ color: "red", fontSize: "12px" }}>
              {auth.error?.email}
            </p>
            {type === "register" && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) =>
                  form.setFieldValue("terms", event.currentTarget.checked)
                }
              />
            )}
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={handleToggle}
              size="xs"
            >
              {type === "register"
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Anchor>
            <Button type="submit" radius="xl">
              {upperFirst(type)}
            </Button>
          </Group>
        </form>
      </Paper>
      <p className="login-backlink">
        Return to{" "}
        <span>
          <Link to={"/"} className="backlink">
            Main Page
          </Link>
        </span>
      </p>
    </div>
  );
}

export default LoginPage;
