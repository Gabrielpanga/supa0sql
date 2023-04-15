CREATE OR REPLACE FUNCTION public.execute_api_query(query text, OUT result text)
    LANGUAGE 'plpgsql'
AS $BODY$
    BEGIN 
        EXECUTE query;
        return;
    END 
$BODY$ SECURITY DEFINER;

