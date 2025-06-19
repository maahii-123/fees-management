import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";

const AuthLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Prefill remembered credentials
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberEmail");
    const rememberedPassword = localStorage.getItem("rememberPassword");

    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");
    setGeneralError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:7000/api/login", {
        email,
        password,
      });

      const { token, name, auth } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("auth", auth);

      if (remember) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberPassword", password);
      } else {
        localStorage.removeItem("rememberEmail");
        localStorage.removeItem("rememberPassword");
      }

      navigate("/");

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errMsg = error.response?.data?.message || "Login failed";

        if (
          errMsg.toLowerCase().includes("email") ||
          errMsg.toLowerCase().includes("user not found") ||
          errMsg.toLowerCase().includes("user")
        ) {
          setEmailError(errMsg);
        } else if (errMsg.toLowerCase().includes("password")) {
          setPasswordError(errMsg);
        } else {
          setGeneralError(errMsg);
        }

        console.error("Login error:", errMsg);
      } else {
        setGeneralError("An unknown error occurred");
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} >
       {/* className="rounded-xl shadow-md bg-white p-6 w-full form-control form-rounded-xl" */}

      {/* Email */}
      <div className="mb-4 form-control form-rounded-xl">
        <div className="mb-2 block">
          <Label htmlFor="Username" value="Email" />
        </div>
        <TextInput
          id="Username"
          type="text"
          sizing="md"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <p className="text-sm text-red-600 mt-1">{emailError}</p>}
      </div>

      {/* Password */}
      <div className="mb-4 form-control form-rounded-xl">
        <div className="mb-2 block">
          <Label htmlFor="userpwd" value="Password" />
        </div>
        <div className="relative ">
          <TextInput
            id="userpwd"
            type={showPassword ? "text" : "password"}
            sizing="md"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-2.5 right-3 text-gray-500"
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        {passwordError && <p className="text-sm text-red-600 mt-1">{passwordError}</p>}
      </div>

      {/* General error */}
      {generalError && <p className="text-sm text-red-600 mb-4 text-center">{generalError}</p>}

      {/* Remember me */}
      <div className="flex justify-between my-5">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <Label htmlFor="remember" className="opacity-90 font-normal cursor-pointer">
            Remember this Device
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        color="primary"
        className="w-full bg-primary text-white rounded-xl"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default AuthLogin;








