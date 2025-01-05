/* eslint-disable react/prop-types */
function Toaster({ tailwindTextColorClass, text }) {
  return (
    <article className="z-50 fixed top-5 right-5 py-3 px-3 rounded-sm bg-slate-600 max-w-[280px]">
      <p className={`${tailwindTextColorClass} text-lg font-semibold`}>
        {text}
      </p>
    </article>
  );
}

export default Toaster;
