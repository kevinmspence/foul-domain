export default function ScrollWrapper({ title, children, size = "default" }) {
  const prefix = size === "large" ? "scroll" : "scroll";

  return (
    <div className="w-full max-w-full flex flex-col items-stretch drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
      {/* Top */}
      <img
        src={`/${prefix}-top.webp`}
        alt="Scroll top"
        className="w-full block"
        draggable={false}
      />

      {/* Middle */}
      <div
        className="w-full bg-repeat-y flex flex-col"
        style={{
          backgroundImage: `url(/${prefix}-middle.webp)`,
          backgroundSize: '100% auto',
          backgroundPosition: 'top center',
          minHeight: '70vh', // ✅ Important fix
        }}
      >
        <div className="px-4 sm:px-8 pt-6 pb-8">
          {title && (
            <h2 className="text-xl sm:text-2xl font-rock text-yellow-200 tracking-wide text-center mb-6">
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>

      {/* Bottom */}
      <img
        src={`/${prefix}-bottom.webp`}
        alt="Scroll bottom"
        className="w-full block"
        draggable={false}
      />
    </div>
  );
}
