import "./App.css";

import { ClerkProviderWrapper } from "./clerk/client";
import { AppRouter } from "./router/AppRouter";

function App()
{
    return (
        <ClerkProviderWrapper>
            <AppRouter />
        </ClerkProviderWrapper>
    );
}

export default App;
