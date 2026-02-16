import React from 'react'
import PrivateLayout from '@/subdomains/backoffice/layout/PrivateLayout'
import { cn } from '@/lib/utils'
import { useGetAllUsers } from '@/utils/services/api/api'
import UserCard from '../../components/UserCard'
import { Code, Crown, Plus, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function BackofficeHomePage() {
    const { data, isLoading } = useGetAllUsers()
    const userGrouped = data?.groupedByAccountType

    const { t } = useTranslation()
    return (
        <PrivateLayout>
            <section className="container mx-2 md:mx-auto my-20 md:my-12 md:pl-0 mt-10 space-y-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-3xl font-bold">{t('backoffice.usersPerPlan')}</h1>
                    </div>
                </div>

                <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", isLoading && "animate-pulse")}>
                    <UserCard
                        title='Básico'
                        icon={User}
                        className='border-stone-50/20 hover:border-stone-50/70 transition-all duration-300'
                        value={userGrouped?.BASIC || 0}
                        textColor='text-white'
                    />

                    <UserCard
                        title='Plus'
                        icon={Plus}
                        className='border-yellow-500/20 hover:border-yellow-500/70 transition-all duration-300'
                        value={userGrouped?.PLUS || 0}
                        textColor='text-yellow-500'
                    />

                    <UserCard
                        title='Premium'
                        icon={Crown}
                        className='border-rose-500/20 hover:border-rose-500/70 transition-all duration-300'
                        value={userGrouped?.PREMIUM || 0}
                        textColor='text-rose-500'
                    />

                    <UserCard
                        title='Admin'
                        icon={Code}
                        className='border-violet-500/20 hover:border-violet-500/70 transition-all duration-300'
                        value={userGrouped?.ADMIN || 0}
                        textColor='text-violet-500'
                    />
                </div>

                <div className="flex flex-col items-start gap-3">
                    <h1 className="text-3xl font-bold">{t('backoffice.totalUsers')}</h1>
                    <p className="text-muted-foreground mb-5">{t('backoffice.totalUsersDescription')}</p>

                    <UserCard
                        title='Total'
                        icon={User}
                        className='border-zinc-50/20 hover:border-zinc-50/70 transition-all duration-300 w-full md:w-72'
                        value={data?.users.length || 0}
                        textColor='text-white'
                    />
                </div>
            </section>
        </PrivateLayout>
    )
}

export default BackofficeHomePage