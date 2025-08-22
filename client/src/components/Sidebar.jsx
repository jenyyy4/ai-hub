import { useClerk, useUser, Protect } from '@clerk/clerk-react'
import { House, SquarePen, Hash, Image, Eraser, Scissors, FileText, Users, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
    {to: '/ai', label: 'Dashboard', Icon: House},
    {to: '/ai/write-article', label: 'Write Article', Icon: SquarePen},
    {to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash},
    {to: '/ai/generate-images', label: 'Generate Images', Icon: Image},
    {to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser},
    {to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors},
    {to: '/ai/review-resume', label: 'Review Resume', Icon: FileText},
    {to: '/ai/community', label: 'Community', Icon: Users}
]

const activeColors = {
  "/ai": "bg-gradient-to-r from-[#ef476f] to-[#f4978e] text-white",
  "/ai/write-article": "bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white",
  "/ai/blog-titles": "bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white",
  "/ai/generate-images": "bg-gradient-to-r from-[#3CB371] to-[#6EE7B7] text-white",
  "/ai/remove-background": "bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white",
  "/ai/remove-object": "bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white",
  "/ai/review-resume": "bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white",
  "/ai/community": "bg-gradient-to-r from-[#ef476f] to-[#f4978e] text-white"
}

const Sidebar = ({ sidebar, setSidebar }) => {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();

    return (
        <div className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${sidebar ? "translate-x-0" : "max-sm:translate-x-full"} transition-all duration-300 ease-in-out`}>
            <div className="my-7 w-full">
                <img src={user.imageUrl} alt="user avatar" className="w-13 rounded-full mx-auto" />
                <h1 className="mt-1 text-center">{user.fullName}</h1>

                <div className="px-6 mt-5 text-sm text-gray-600 font-medium">
                    {navItems.map(({ to, label, Icon }) => (
                        <NavLink key={to} to={to} end={to === '/ai'} onClick={() => setSidebar(false)} className={({isActive}) => `px-3.5 py-2.5 flex items-center gap-3 rounded ${isActive ? activeColors[to] : ""}`}>
                            {({isActive}) => (
                                <>
                                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                                    {label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
                <div onClick={openUserProfile} className="flex gap-2 items-center cursor-pointer">
                    <img src={user.imageUrl} className="w-8 rounded-full" alt="" />
                    <div>
                        <h1 className="text-sm font-medium">{user.fullName}</h1>
                    </div>
                </div>
                <LogOut onClick={signOut} className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer" />
            </div>
        </div>
    )
}

export default Sidebar;