import { useParams } from 'react-router';
import { Container } from '@ifrc-go/ui';
import { gql } from 'urql';

import Page from '#components/Page';
import PowerBIEmbed from '#components/PowerBiEmbed';
import { useExternalDashboardDetailQuery } from '#generated/types/graphql';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EXTERNAL_DASHBOARD_DETAIL_QUERY = gql`
    query ExternalDashboardDetail($id: ID!) {
        externalDashboard(id: $id) {
            id
            title
            description
            url
        }
    }
`;

export default function DashboardDetail() {
    const { id } = useParams<{ id: string }>();

    const [{ data, fetching, error }] = useExternalDashboardDetailQuery({
        variables: { id: id ?? '' },
        pause: !id,
    });

    const dashboard = data?.externalDashboard;

    return (
        <Page
            title={dashboard?.title}
            heading={dashboard?.title}
            description={dashboard?.description}
        >
            <Container
                pending={fetching}
                errored={!!error}
                errorMessage="Dashboard not found."
            >
                {dashboard && <PowerBIEmbed embedUrl={dashboard.url} />}
            </Container>
        </Page>
    );
}
