import type { GetServerSidePropsContext, GetStaticPropsResult } from "next";
import Head from "next/head";
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
  TextInput,
  Toggle,
  ToggleItem,
} from "@tremor/react";
import { DBTable, MinimalHistory, getMinimalHistory } from "../utils/types";
import { getHistoryFromUser } from "../utils/supabase-admin";
import axios from "axios";
import SyntaxHighlighter from "react-syntax-highlighter";
import DynamicChart from "../components/DynamicChart";
import History from "../components/History";

interface Props {
  user: User;
  history: any[];
}

export default function Home({ user, history }: Props) {
  const [selectedView, setSelectedView] = useState("1");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnnonKey, setSupabaseAnnonKey] = useState("");
  const [useConfig, setUseConfig] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState<
    MinimalHistory | undefined
  >(undefined);
  const [histories, setHistories] = useState<MinimalHistory[]>([...history]);

  // call schema api endpoint to recover table and store it on state
  const [tables, setTables] = useState<DBTable[]>([]);
  const onFetchTables = useCallback(() => {
    const fetchData = async () => {
      const { data } = await axios.post("/api/schema", {
        supabaseUrl,
        supabaseAnnonKey,
      });
      return data.tables;
    };

    fetchData()
      .then((tables) => setTables(tables))
      .catch((err) => {
        alert(
          "Error while fetching tables. Please check your Supabase URL and Annon Key: " +
            err.response.data.error
        );
      });
  }, [supabaseUrl, supabaseAnnonKey]);

  const onGenerateQuery = useCallback(() => {
    if (!tables || tables.length === 0) {
      alert('Please load tables first by clicking "Load tables"');
      return;
    }

    const fetchData = async () => {
      const { data } = await axios.post("/api/generate", {
        tables,
        queryInput,
      });
      return data.data;
    };

    fetchData()
      .then((history) => {
        setGeneratedQuery(history);
        setHistories([history, ...histories]);
      })
      .catch((err) => {
        alert(
          "Error while generating query. Please check your query: " +
            err.response.data.error
        );
      });
  }, [tables, queryInput, histories]);

  const onFetchResults = (historyId: number) => {
    const fetchData = async () => {
      const { data } = await axios.post(`/api/query?history_id=${historyId}`);
      return data.data;
    };
    fetchData().then((results) => {
      if (generatedQuery?.id === historyId) {
        setGeneratedQuery({
          ...generatedQuery,
          response: {
            ...(generatedQuery.response || { type: "donut" }),
            results,
          },
        });
      }

      const historyToUpdate = histories.find((h) => h.id === historyId);
      if (!historyToUpdate) return;
      historyToUpdate.response = {
        ...(historyToUpdate.response || { type: "donut" }),
        results,
      };
      setHistories([...histories]);
    });
  };

  const onSaveHistory = async (historyId: number) => {
    const history = histories.find((h) => h.id === historyId);
    if (!history) return;
    await axios.patch(`/api/history/${historyId}`, {
      response: history?.response,
    });
  };

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
          <Tab value="2" text="Create" />
          <Tab value="3" text="History" />
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

            <Block maxWidth="max-w-md" marginTop="mt-20">
              <Toggle
                color="zinc"
                value={useConfig ? "true" : "false"}
                onValueChange={(value) => setUseConfig(value === "true")}
              >
                <ToggleItem value="false" text="Use Env Config" />
                <ToggleItem value="true" text="Use Input" />
              </Toggle>

              <TextInput
                placeholder="Supabase URL"
                marginTop="mt-6"
                onChange={(e) => setSupabaseUrl(e.target.value)}
                value={supabaseUrl}
                disabled={!useConfig}
              />

              <TextInput
                placeholder="Supabase Annon Key"
                marginTop="mt-6"
                onChange={(e) => setSupabaseAnnonKey(e.target.value)}
                value={supabaseAnnonKey}
                disabled={!useConfig}
              />

              <Button
                onClick={onFetchTables}
                marginTop="mt-6"
                size="xl"
                color="red"
              >
                Load tables
              </Button>
            </Block>
          </>
        ) : undefined}

        {selectedView === "2" ? (
          <>
            <Block>
              <TextInput
                placeholder="Type what you want to query... (e.g. 'show me the number of sales per customer')"
                marginTop="mt-6"
                onChange={(e) => setQueryInput(e.target.value)}
                value={queryInput}
              />
              <Button
                onClick={onGenerateQuery}
                marginTop="mt-6"
                size="xl"
                color="blue"
              >
                Generate Query
              </Button>
            </Block>

            <Block marginTop="mt-10">
              {generatedQuery && (
                <History
                  history={generatedQuery}
                  onSaveHistory={onSaveHistory}
                  onFetchResults={onFetchResults}
                />
              )}
            </Block>
          </>
        ) : undefined}

        {selectedView === "3" ? (
          <>
            <Block marginTop="mt-10">
              <ColGrid numColsSm={2} gapX="gap-x-6" gapY="gap-y-6">
                {histories.map((query) => (
                  <History
                    key={query.id}
                    history={query}
                    onSaveHistory={onSaveHistory}
                    onFetchResults={onFetchResults}
                  />
                ))}
              </ColGrid>
            </Block>
          </>
        ) : undefined}
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
  const histories = await getHistoryFromUser(session.user.id);
  return {
    props: {
      user: session.user,
      history: histories.map(getMinimalHistory),
    },
  };
}
