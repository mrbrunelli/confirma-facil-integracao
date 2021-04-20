import axios from "axios"

const api = axios.create({
  baseURL: "https://utilities.confirmafacil.com.br/"
})

export default api
