"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import Step1 from "@/components/steps/Step1";
import Step2 from "@/components/steps/Step2";
import Step3 from "@/components/steps/Step3";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const dot1Ref = useRef<HTMLDivElement>(null);
  const dot2Ref = useRef<HTMLDivElement>(null);
  const dot3Ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [hasStep2Selection, setHasStep2Selection] = useState(false);
  const [hasStep3Selection, setHasStep3Selection] = useState(false);

  useGSAP(
    () => {
      gsap.set(step2Ref.current, { xPercent: 100, autoAlpha: 0 });
      gsap.set(step3Ref.current, { xPercent: 100, autoAlpha: 0 });
      gsap.set(dot1Ref.current, { width: "2.5rem" });
      gsap.set([dot2Ref.current, dot3Ref.current], { width: "0.75rem" });
    },
    { scope: containerRef }
  );

  const handleNext = () => {
    if (step === 1) {
      const tl = gsap.timeline({
        defaults: { duration: 0.6, ease: "power2.inOut" },
      });
      tl.to(step1Ref.current, { xPercent: -100, autoAlpha: 0 }, 0)
        .to(step2Ref.current, { xPercent: 0, autoAlpha: 1 }, 0)
        .to(dot1Ref.current, { width: "0.75rem" }, 0)
        .to(dot2Ref.current, { width: "2.5rem" }, 0)
        .add(() => setStep(2));
    } else if (step === 2) {
      const tl = gsap.timeline({
        defaults: { duration: 0.6, ease: "power2.inOut" },
      });
      tl.to(step2Ref.current, { xPercent: -100, autoAlpha: 0 }, 0)
        .to(step3Ref.current, { xPercent: 0, autoAlpha: 1 }, 0)
        .to(dot2Ref.current, { width: "0.75rem" }, 0)
        .to(dot3Ref.current, { width: "2.5rem" }, 0)
        .add(() => setStep(3));
    } else if (step === 3) {
      window.location.href = "/sign-up";
    }
  };

  return (
    <section className="">
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="h-2/3 w-full relative" ref={containerRef}>
          <div
            ref={step1Ref}
            className="absolute inset-0 flex flex-col items-center justify-center gap-10 pt-20"
          >
            <Step1 />
          </div>
          <div
            ref={step2Ref}
            className="absolute inset-0 flex flex-col items-center justify-center gap-10 pt-20"
          >
            <Step2 onSelectionChange={setHasStep2Selection} />
          </div>
          <div
            ref={step3Ref}
            className="absolute inset-0 flex flex-col items-center justify-center gap-10 pt-20"
          >
            <Step3 onSelectionChange={setHasStep3Selection} />
          </div>
        </div>
        <div className="h-1/3 flex flex-col items-center justify-center gap-10">
          <div className="flex gap-2">
            <div ref={dot1Ref} className="h-3 bg-purple-500 rounded-full" />
            <div ref={dot2Ref} className="h-3 bg-purple-500 rounded-full" />
            <div ref={dot3Ref} className="h-3 bg-purple-500 rounded-full" />
          </div>
          <Button
            className="w-80 h-12"
            variant={"secondary"}
            onClick={handleNext}
            disabled={
              (step === 2 && !hasStep2Selection) ||
              (step === 3 && !hasStep3Selection)
            }
          >
            {step === 1 ? "Get Started" : step === 2 ? "Continue" : "Sign Up"}{" "}
            <ArrowRightIcon size={32} />
          </Button>
        </div>
      </div>
    </section>
  );
}
