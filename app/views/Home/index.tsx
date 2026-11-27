import { DashboardFillIcon } from '@ifrc-go/icons';
import {
    Container,
    ListView,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import DashboardCard from '#components/DashboardCard';
import InfoCard from '#components/InfoCard';
import KoboKeyFigures from '#components/KoboKeyFigures';
import Page from '#components/Page';
import {
    DashboardPage,
    type ExternalDashboardsQuery,
    useExternalDashboardsQuery,
} from '#generated/types/graphql';
import type { RouteKeys } from '#root/config/routes';
import useRouting from '#root/hooks/useRouting';
import ActiveOperation from '#views/Home/ActiveOperation';
import FieldAlerts from '#views/Home/FieldAlerts';

type ExternalDashboard = ExternalDashboardsQuery['externalDashboards']['results'][number];

const DASHBOARD_PAGE_TO_ROUTE_KEY: Record<DashboardPage, RouteKeys> = {
    [DashboardPage.CapacityResources]: 'capacityAndResources',
    [DashboardPage.DisasterResponse]: 'disasterResponse',
    [DashboardPage.EmergencyAlerts]: 'emergencyAlert',
    [DashboardPage.EmergencyResponse]: 'emergencyResponse',
    [DashboardPage.Home]: 'home',
    [DashboardPage.Operations]: 'home',
    [DashboardPage.ProjectMapping]: 'projectMapping',
};

function Home() {
    const routeTo = useRouting();

    const [{ data, fetching }] = useExternalDashboardsQuery({
        variables: {
            filters: {
                isActive: true,
                showOnHome: true,
            },
            pagination: {
                limit: 6,
            },
        },
    });

    const operationDashboards = data?.externalDashboards.results ?? [];

    const handleViewClick = (dashboard: ExternalDashboard) => {
        const { page, capacityAndResourceId } = dashboard;

        if (page === DashboardPage.CapacityResources && isDefined(capacityAndResourceId)) {
            routeTo('capacityAndResourcesDetails', { id: capacityAndResourceId });
            return;
        }

        const routeKey = DASHBOARD_PAGE_TO_ROUTE_KEY[page];
        routeTo(routeKey);
    };

    return (
        <Page
            title="Home"
            heading="ERCS Emergency Operations Centre"
            description="Real-time operational intelligence and situational awareness for emergency response"
            info={<KoboKeyFigures withEmergencies />}
        >
            <ListView
                layout="block"
            >
                <ActiveOperation />
                <FieldAlerts />
                <Container
                    pending={fetching}
                >
                    <ListView
                        layout="block"
                    >

                        <InfoCard
                            icon={<DashboardFillIcon />}
                            title="Operational Dashboards"
                            description="Real-time emergency alerts and early warning system monitoring across regions"
                        />
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={3}
                        >
                            {operationDashboards.map((res) => (
                                <DashboardCard
                                    key={res.id}
                                    title={res.title}
                                    summary={res.description}
                                    pillText={res.pageDisplay}
                                    onViewClick={() => handleViewClick(res)}
                                />
                            ))}
                        </ListView>
                    </ListView>
                </Container>
            </ListView>
        </Page>
    );
}

export default Home;
