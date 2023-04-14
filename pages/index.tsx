import type {
  GetServerSidePropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {
  User,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { useCallback, useState } from "react";
import { DesktopComputerIcon } from "@heroicons/react/solid";
import {
  Button,
  Card,
  Flex,
  Icon,
  List,
  ListItem,
  Title,
  Text,
  Bold,
  Block,
  ColGrid,
  Subtitle,
  TabList,
  Tab,
} from "@tremor/react";
import { DBTable } from "../utils/types";
import { getHistoryFromUser } from "../utils/supabase-admin";

interface Props {
  user: User;
  history: any[];
}

export default function Home({ user }: Props) {
  const [selectedView, setSelectedView] = useState("1");

  // call schema api endpoint to recover table and store it on state
  const [tables, setTables] = useState<DBTable[]>([]);
  const onFetchTables = useCallback(async () => {
    console.log("fetching");
    const res = await fetch("/api/schema");
    const data = await res.json();
    setTables(data.tables);
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-slate-50 p-6 sm:p-10">
        <Title>Welcome to Supa0SQL, {user.email}!</Title>
        <Subtitle>
          This is your SQL companion to draft charts from natural language
        </Subtitle>

        <TabList
          defaultValue="1"
          onValueChange={(value) => setSelectedView(value)}
          marginTop="mt-6"
        >
          <Tab value="1" text="Schema" />
          <Tab value="2" text="Charts" />
        </TabList>

        {selectedView === "1" ? (
          <>
            <ColGrid numCols={6} gapX="gap-x-6" gapY="gap-y-6" marginTop="mt-6">
              {tables.map((table) => (
                <Card key={table.name} maxWidth="max-w-sm">
                  <Title>{table.name}</Title>
                  <List marginTop="mt-4">
                    {table.fields.map((field) => (
                      <ListItem key={field.name}>
                        <Flex
                          justifyContent="justify-start"
                          spaceX="space-x-4"
                          truncate={true}
                        >
                          <Icon
                            variant="light"
                            icon={DesktopComputerIcon}
                            size="md"
                            color="emerald"
                          />
                          <Block truncate={true}>
                            <Text truncate={true}>
                              <Bold>{field.name}</Bold>
                            </Text>
                            <Text truncate={true}>
                              {field.type || field.format}
                            </Text>
                          </Block>
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                </Card>
              ))}
            </ColGrid>

            <Button
              onClick={onFetchTables}
              marginTop="mt-6"
              size="xl"
              color="red"
            >
              Load tables
            </Button>
          </>
        ) : undefined}

        {selectedView === "2" ? <></> : undefined}
      </main>

      <footer></footer>
    </div>
  );
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext
): Promise<GetStaticPropsResult<Props>> {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  // TODO: Get the user's history to avoid abuse

  const history = await getHistoryFromUser(session.user.id);
  return {
    props: {
      user: session.user,
      history,
    },
  };
}
