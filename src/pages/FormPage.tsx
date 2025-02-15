import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Logo from "../components/Logo";
import axios from "axios";

interface FormData {
  name: string;
  phone: string;
  email: string;
}

const FormPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        navigate("/");
      }, 60000); // 1 minute
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    // Start the timer
    resetTimer();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);

  const onSubmit = (data: FormData) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    const response = axios.post("http://udaanapi.zetrance.com/save", data);
    navigate("/photo");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center ">
      <Link to="/" className="flex items-center justify-center gap-2 py-8">
        <img src="/images/logo.png" alt="Logo" className="w-auto h-auto" />
      </Link>

      <div className="w-full max-w-2xl p-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-xl">
        <h2 className="text-4xl font-serif text-white text-center mb-8">
          Your Information
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="Full Name"
              className="w-full px-6 py-4 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-2xl"
            />
            {errors.name && (
              <p className="mt-1 text-red-300 text-lg">{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("phone", {
                required: "Phone number is required",
                validate: {
                  validLength: (value) => {
                    // Remove all non-digit characters
                    const digitsOnly = value.replace(/\D/g, "");
                    return (
                      digitsOnly.length === 10 ||
                      "Phone number must be 10 digits"
                    );
                  },
                  validFormat: (value) => {
                    // Check if it matches a valid phone format after cleaning
                    const cleaned = value.replace(/\D/g, "");
                    return (
                      /^\d{10}$/.test(cleaned) || "Invalid phone number format"
                    );
                  },
                },
              })}
              placeholder="Phone Number"
              className="w-full px-6 py-4 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-2xl"
            />
            {errors.phone && (
              <p className="mt-1 text-red-300 text-lg">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="Email Address"
              className="w-full px-6 py-4 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-2xl"
            />
            {errors.email && (
              <p className="mt-1 text-red-300 text-lg">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-12 py-6 bg-white bg-opacity-20 rounded-lg text-white text-3xl font-semibold hover:bg-opacity-30 transition-all duration-300"
          >
            Take Photo
          </button>
          {/* <button
          onClick={(e)=>{navigate('/')}}
            type="submit"
            className="w-full px-12 py-6 bg-white bg-opacity-20 rounded-lg text-white text-3xl font-semibold hover:bg-opacity-30 transition-all duration-300"
          >
            Home
          </button> */}
        </form>
      </div>
    </div>
  );
};

export default FormPage;
