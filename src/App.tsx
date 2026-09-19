import { Route, Switch } from "wouter";
import AppBar from "@/components/layout/AppBar";
import TabBar from "@/components/layout/TabBar";
import ScrollToTop from "@/components/layout/ScrollToTop";
import Home from "@/pages/Home";
import Lab from "@/pages/Lab";
import Crew from "@/pages/Crew";
import Mint from "@/pages/Mint";
import Peek from "@/pages/Peek";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AppBar />
      <main className="app">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/lab" component={Lab} />
          <Route path="/crew" component={Crew} />
          <Route path="/mint" component={Mint} />
          <Route path="/peek" component={Peek} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <TabBar />
    </>
  );
}
