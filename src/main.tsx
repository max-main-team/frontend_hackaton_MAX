import { createRoot } from "react-dom/client";
import "@maxhub/max-ui/dist/styles.css";
import "./index.css";
import { MaxUI } from "@maxhub/max-ui";
import App from "./App";

const Root = () => (
    <MaxUI>
        <App />
    </MaxUI>
)

export default Root;

createRoot(document.getElementById('root')!).render(<Root />)
