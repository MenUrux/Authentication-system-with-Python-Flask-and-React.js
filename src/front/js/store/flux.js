const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			currentUser: null,
            authError: null
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: async () => {
				try {
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

			testToken: async (user) => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/create-token", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify(user)
					});
					if (!resp.ok) {
						throw new Error("Invalid login credentials");
					}
					const data = await resp.json();
					setStore({ currentUser: data.user, authError: null });
				} catch (error) {
					setStore({ currentUser: null, authError: error.message });
					console.log("Login error:", error);
				}
			},


			getUserProfile: async () => {
                try {
                    const token = getActions().getToken();
                    if (!token) throw new Error("No token found");

                    const resp = await fetch(process.env.BACKEND_URL + "/api/profile", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    if (!resp.ok) {
                        throw new Error("Error fetching profile");
                    }
                    const data = await resp.json();
                    setStore({ currentUser: data });
                    return data;
                } catch (error) {
                    console.log("Error loading user profile from backend", error);
                    setStore({ authError: error.message });
                }
            },

            getToken: () => {
                return localStorage.getItem("jwt_token");
            },

			logout: () => {
                localStorage.removeItem("jwt_token");
                setStore({ currentUser: null });
            },

            login: async (user) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(user)
                    });
                    if (!resp.ok) {
                        const errorData = await resp.json();
                        throw new Error(errorData.error || "Invalid email or password");
                    }
                    const data = await resp.json();
                    localStorage.setItem("jwt_token", data.access_token);
                    setStore({ currentUser: data.user, authError: null });
                    return true;
                } catch (error) {
                    setStore({ currentUser: null, authError: error.message });
                    console.log("Login error:", error);
                    return false;
                }
            },

            register: async (user) => {
                try {
                    const resp = await fetch(process.env.BACKEND_URL + "/api/register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(user)
                    });
                    if (!resp.ok) {
                        const errorData = await resp.json();
                        throw new Error(errorData.error || "Registration failed");
                    }
                    const data = await resp.json();
                    localStorage.setItem("jwt_token", data.access_token);
                    setStore({ currentUser: data.user, authError: null });
                } catch (error) {
                    setStore({ currentUser: null, authError: error.message });
                    console.log("Registration error:", error);
                }
            },

			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;
