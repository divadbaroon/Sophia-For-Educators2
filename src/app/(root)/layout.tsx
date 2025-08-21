import { ReactNode } from "react"
import NavbarWrapper from "@/components/NavbarWrapper"

const Layout = ({ children }: { children: ReactNode}) => {
    return (
        <div>
            <NavbarWrapper/>
            {children}
        </div>
    )
}

export default Layout