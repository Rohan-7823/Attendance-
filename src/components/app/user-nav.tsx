import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Settings } from "lucide-react";

export function UserNav({ user }: { user: User }) {
  return (
    <Link 
      href="/profile" 
      className="flex items-center justify-between p-2 rounded-xl transition-all hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 group w-full"
    >
      <div className="flex items-center space-x-3 text-left overflow-hidden">
        <Avatar className="h-10 w-10 ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="bg-indigo-700 text-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
            {user.name}
          </span>
          <Badge variant="outline" className="w-fit text-[10px] py-0 px-1.5 border-slate-700 text-indigo-400 font-semibold capitalize bg-indigo-500/5">
            {user.role}
          </Badge>
        </div>
      </div>
      <Settings className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:rotate-45 transition-all duration-300 ml-2 shrink-0" />
    </Link>
  );
}
