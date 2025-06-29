import { Card, CardContent } from "@/components/ui/card";

export const MadeWithDyad = () => {
  return (
    <Card className="w-full max-w-xs mx-auto mt-8 p-2 text-center shadow-lg bg-card/80 backdrop-blur-sm border border-border">
      <CardContent className="p-0">
        <a
          href="https://www.dyad.sh/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center gap-1"
        >
          Made with <span className="font-semibold text-blue-600 dark:text-blue-400">Dyad</span>
        </a>
      </CardContent>
    </Card>
  );
};