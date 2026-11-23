import { Outlet } from 'react-router';
import {
    InspectIcon,
    MapIcon,
} from '@ifrc-go/icons';
import {
    ListView,
    NavigationTabList,
} from '@ifrc-go/ui';
import { gql } from 'urql';

import KoboKeyFigures from '#components/KoboKeyFigures';
import NavigationTab from '#components/NavigationTab';
import Page from '#components/Page';

// NOTE: There is limit of 20 dashboards for now, as we don't have more than that.
// We can add pagination if needed in the future

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EXTERNAL_DASHBOARDS_QUERY = gql`
    query ExternalDashboards(
        $pagination: OffsetPaginationInput,
        $filters: ExternalDashboardFilter
    ) {
        externalDashboards(
            filters: $filters
            pagination: $pagination
        ) {
            results {
                title
                updatedAt
                order
                id
                isActive
                createdAt
                description
                page
                regionId
                showOnHome
                pageDisplay
                url
                capacityAndResourceId
            }
            pageInfo {
                limit
                offset
            }
            totalCount
        }
    }
`;
function OurWork() {
    return (
        <Page
            title="Our Work"
            heading="National EOC Operations"
            description="Comprehensive operational intelligence and emergency coordination dashboards"
            info={<KoboKeyFigures />}
        >
            <ListView
                layout="block"
                spacing="xl"
            >
                <NavigationTabList>
                    <NavigationTab
                        to="emergencyResponse"
                    >
                        <ListView
                            spacing="2xs"
                            withCenteredContents
                        >
                            <InspectIcon />
                            <span>
                                Emergency Response
                            </span>
                        </ListView>
                    </NavigationTab>
                    <NavigationTab
                        to="projectMapping"
                    >
                        <ListView
                            spacing="2xs"
                            withCenteredContents
                        >
                            <MapIcon />
                            <span>
                                Project Mapping
                            </span>
                        </ListView>
                    </NavigationTab>

                </NavigationTabList>
                <Outlet />
            </ListView>
        </Page>
    );
}

export default OurWork;
