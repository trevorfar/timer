const Footer = ({ user, url }: { user: string | null; url: string | null }) => {
  if (!user && !url) return null;
  return (
    <footer className="fixed right-0 bottom-0 z-10 p-4 text-sm">
      <div className="inline-flex gap-3 text-white/70 [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)]">
        {user && <span>{user}</span>}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            View author
          </a>
        )}
      </div>
    </footer>
  );
};

export default Footer;
