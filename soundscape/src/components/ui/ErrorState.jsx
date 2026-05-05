export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-accent-rose/10 flex items-center justify-center">
        <span className="text-accent-rose text-xl">⚠</span>
      </div>
      <div>
        <p className="text-text-primary font-body font-medium">{message}</p>
        <p className="text-text-muted text-sm mt-1">Check your connection and try again.</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded-full border border-white/10 text-text-secondary
                     text-sm hover:text-text-primary hover:border-white/20
                     transition-colors duration-150"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
