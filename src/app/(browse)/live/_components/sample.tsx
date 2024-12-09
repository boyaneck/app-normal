import { useEffect, useRef } from "react";

function Sample() {
  const boxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const box = boxRef.current;

    if (button && box) {
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        const boxTop = box.offsetTop;

        if (scrollTop > boxTop - 200) {
          box.style.transform = "scale(1.2)";
          box.style.transition = "transform 0.5s ease-in-out";
        } else {
          box.style.transform = "scale(1)";
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="border border-black">
      <button ref={buttonRef} style={{ marginBottom: "100vh" }}>
        Scroll Down
      </button>
      <div
        ref={boxRef}
        style={{
          width: "200px",
          height: "200px",
          backgroundColor: "blue",
          margin: "0 auto",
          transform: "scale(1)",
        }}
      />
    </div>
  );
}

export default Sample;
