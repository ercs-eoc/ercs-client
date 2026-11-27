import {
    useCallback,
    useState,
} from 'react';
import {
    AlarmWarningLineIcon,
    AlertLineIcon,
    HeartAddLineIcon,
    PencilLineIcon,
    ShieldUserLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateInput,
    Description,
    IconButton,
    ListView,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import KeyCard from '#components/KeyCard';
import { useKoboStatsQuery } from '#generated/types/graphql';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const KOBO_STATS_QUERY = gql`
    query KoboStats($startDate: Date, $endDate: Date) {
        koboStats(startDate: $startDate, endDate: $endDate) {
            alert {
                totalEmergencies
                peopleAffected
                source {
                    formLabel
                    assetUid
                    lastFetchedAt
                    confirmedRecords
                }
            }
            rapidNeeds {
                peopleInNeed
            }
            field {
                peopleReached
            }
        }
    }
`;

interface DateFilter {
    startDate?: string;
    endDate?: string;
}

// Mirrors STATS_WINDOW (180 days) in backend/apps/kobo/stats.py, used when no date is set
const DEFAULT_WINDOW_LABEL = 'Last 6 months';

function formatDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getWindowLabel({ startDate, endDate }: DateFilter) {
    if (isDefined(startDate) && isDefined(endDate)) {
        return `${formatDate(startDate)} – ${formatDate(endDate)}`;
    }
    if (isDefined(startDate)) {
        return `Since ${formatDate(startDate)}`;
    }
    if (isDefined(endDate)) {
        return `Until ${formatDate(endDate)}`;
    }
    return DEFAULT_WINDOW_LABEL;
}

interface Props {
    withEmergencies?: boolean;
}

function KoboKeyFigures(props: Props) {
    const { withEmergencies } = props;

    const [dateFilter, setDateFilter] = useState<DateFilter>({});
    const [showDateInputs, setShowDateInputs] = useState(false);

    const [{ data, fetching }] = useKoboStatsQuery({
        variables: {
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
        },
    });
    const koboStats = data?.koboStats;

    const handleDateChange = useCallback(
        (value: string | undefined, name: keyof DateFilter) => {
            setDateFilter((prevFilter) => ({ ...prevFilter, [name]: value || undefined }));
        },
        [],
    );

    const handleClearClick = useCallback(() => {
        setDateFilter({});
        setShowDateInputs(false);
    }, []);

    const handleChangeRangeClick = useCallback(() => {
        setShowDateInputs(true);
    }, []);

    const handleDoneClick = useCallback(() => {
        setShowDateInputs(false);
    }, []);

    const isFiltered = isDefined(dateFilter.startDate) || isDefined(dateFilter.endDate);

    const lastFetchedAt = koboStats?.alert.source.lastFetchedAt;
    const statsMeta = [
        lastFetchedAt ? `Updated ${formatDate(lastFetchedAt)}` : undefined,
        getWindowLabel(dateFilter),
    ].filter(isDefined).join(' · ');

    return (
        <Container
            pending={fetching}
            overlayPending
            footerActions={showDateInputs && (
                <Description
                    textSize="sm"
                    withLightText
                >
                    {statsMeta}
                </Description>
            )}
            headerActions={!showDateInputs ? (
                <ListView
                    className={styles.statsMeta}
                    spacing="3xs"
                    withCenteredContents
                >
                    <Description
                        textSize="sm"
                        withLightText
                    >
                        {statsMeta}
                    </Description>
                    <IconButton
                        className={styles.editButton}
                        name={undefined}
                        onClick={handleChangeRangeClick}
                        title="Change date range"
                        ariaLabel="Change date range"
                        variant="tertiary"
                    >
                        <PencilLineIcon />
                    </IconButton>
                </ListView>
            ) : (
                <div className={styles.dateFilter}>
                    <DateInput
                        className={styles.dateInput}
                        inputClassName={styles.input}
                        name="startDate"
                        label="From"
                        spacing="3xs"
                        value={dateFilter.startDate}
                        max={dateFilter.endDate}
                        onChange={handleDateChange}
                    />
                    <DateInput
                        className={styles.dateInput}
                        inputClassName={styles.input}
                        name="endDate"
                        label="To"
                        spacing="3xs"
                        value={dateFilter.endDate}
                        min={dateFilter.startDate}
                        onChange={handleDateChange}
                    />
                    <Button
                        name={undefined}
                        onClick={handleClearClick}
                        disabled={!isFiltered}
                        styleVariant="transparent"
                        textSize="sm"
                        spacing="4xs"
                    >
                        Clear
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleDoneClick}
                        styleVariant="transparent"
                        textSize="sm"
                        spacing="4xs"
                    >
                        Done
                    </Button>
                </div>
            )}
        >
            <ListView
                layout="grid"
                numPreferredGridColumns={withEmergencies ? 4 : 3}
            >
                {withEmergencies && (
                    <KeyCard
                        icon={<AlarmWarningLineIcon />}
                        value={koboStats?.alert.totalEmergencies ?? 0}
                        valueType="number"
                        size="lg"
                        label="Emergencies"
                    />
                )}
                <KeyCard
                    icon={<HeartAddLineIcon />}
                    value={koboStats?.field.peopleReached ?? 0}
                    valueType="number"
                    size="lg"
                    valueOptions={{ compact: true }}
                    label="People Reached"
                />
                <KeyCard
                    icon={<AlertLineIcon />}
                    value={koboStats?.alert.peopleAffected ?? 0}
                    valueType="number"
                    size="lg"
                    valueOptions={{ compact: true }}
                    label="Population Affected"
                />
                <KeyCard
                    icon={<ShieldUserLineIcon />}
                    value={koboStats?.rapidNeeds.peopleInNeed ?? 0}
                    valueType="number"
                    size="lg"
                    valueOptions={{ compact: true }}
                    label="People in Need"
                />
            </ListView>
        </Container>
    );
}

export default KoboKeyFigures;
