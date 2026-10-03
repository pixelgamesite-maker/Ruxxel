import { Route, Switch } from "wouter";
import AppBar from "@/components/layout/AppBar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import PixelRipple from "@/components/fx/PixelRipple";
import Home from "@/pages/Home";
import Mine from "@/pages/Mine";
import Dig from "@/pages/Dig";
import Worlds from "@/pages/Worlds";
import Mint from "@/pages/Mint";
import Claim from "@/pages/Claim";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <>
      <PixelRipple />
      <ScrollToTop />
      <AppBar />
      <main className="app">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/mine" component={Mine} />
          <Route path="/dig" component={Dig} />
          <Route path="/worlds" component={Worlds} />
          <Route path="/mint" component={Mint} />
          <Route path="/claim" component={Claim} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}
