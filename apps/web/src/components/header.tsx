import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // We'll add this next

export default function Header() {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>AJ</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <div>Amit Jadhav</div>
          <div className="text-gray-400">Admin</div>
        </div>
      </div>
    </header>
  );
}