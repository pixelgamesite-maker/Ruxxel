import { Route, Switch } from "wouter";
import AppBar from "@/components/layout/AppBar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import Home from "@/pages/Home";
import Checkpoint from "@/pages/Checkpoint";
import Gallery from "@/pages/Gallery";
import Claim from "@/pages/Claim";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AppBar />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/checkpoint" component={Checkpoint} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/claim" component={Claim} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}
