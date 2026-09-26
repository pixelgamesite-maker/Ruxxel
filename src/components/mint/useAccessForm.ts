import { useEffect, useState } from "react";
import { supabase, supabaseReady, ACCESS_TABLE } from "@/lib/supabase";
import { isEvmAddress, isHttpUrl } from "@/lib/format";

const DRAFT = "ruxxells_access_draft_v1";
const DONE = "ruxxells_access_submitted_v1";

export function useAccessForm() {
  const [twitter, setTwitter] = useState("");
  const [quoteUrl, setQuoteUrl] = useState("");
  const [wallet, setWallet] = useState("");

  const [twitterOk, setTwitterOk] = useState(false);
  const [engagedOk, setEngagedOk] = useState(false);
  const [quoteOk, setQuoteOk] = useState(false);
  const [walletOk, setWalletOk] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT);
      if (raw) {
        const d = JSON.parse(raw);
        setTwitter(d.twitter ?? "");
        setQuoteUrl(d.quoteUrl ?? "");
        setWallet(d.wallet ?? "");
        setTwitterOk(Boolean(d.twitterOk));
        setEngagedOk(Boolean(d.engagedOk));
        setQuoteOk(Boolean(d.quoteOk));
        setWalletOk(Boolean(d.walletOk));
      }
      if (localStorage.getItem(DONE) === "true") setSubmitted(true);
    } catch {
      /* unreadable draft, start fresh */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      DRAFT,
      JSON.stringify({ twitter, quoteUrl, wallet, twitterOk, engagedOk, quoteOk, walletOk }),
    );
  }, [twitter, quoteUrl, wallet, twitterOk, engagedOk, quoteOk, walletOk, loaded]);

  const step1 = twitterOk && twitter.trim().length > 1;
  const step2 = step1 && engagedOk;
  const step3 = step2 && quoteOk && isHttpUrl(quoteUrl);
  const step4 = step3 && walletOk && isEvmAddress(wallet);
  const complete = step1 && step2 && step3 && step4;
  const done = [step1, step2, step3, step4].filter(Boolean).length;

  async function submit() {
    if (!complete) {
      setError("Finish all four steps before submitting.");
      return;
    }
    if (submitted) {
      setError("This device has already submitted an application.");
      return;
    }
    if (!supabaseReady || !supabase) {
      setError("Applications are not connected yet. Add your Supabase keys to .env to enable them.");
      return;
    }

    setError("");
    setSending(true);

    const { error: e } = await supabase.from(ACCESS_TABLE).insert([
      {
        wallet: wallet.trim(),
        twitter: twitter.trim().replace(/^@/, ""),
        quote_url: quoteUrl.trim(),
      },
    ]);

    setSending(false);

    if (e) {
      setError(
        e.code === "23505"
          ? "That wallet is already on the list. One application per wallet."
          : "The application did not save. Check your connection and try again.",
      );
      return;
    }

    localStorage.setItem(DONE, "true");
    setSubmitted(true);
  }

  return {
    twitter, setTwitter,
    quoteUrl, setQuoteUrl,
    wallet, setWallet,
    twitterOk, setTwitterOk,
    engagedOk, setEngagedOk,
    quoteOk, setQuoteOk,
    walletOk, setWalletOk,
    step1, step2, step3, step4,
    complete, done,
    sending, error, submitted, submit,
  };
}
